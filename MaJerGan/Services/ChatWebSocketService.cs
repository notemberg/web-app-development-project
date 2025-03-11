using System.Net.WebSockets;
using System.Text;
using System.Collections.Concurrent;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using MaJerGan.Data;  // ✅ เปลี่ยนเป็น namespace ของโปรเจค
using MaJerGan.Models; // ✅ เปลี่ยนเป็น namespace ของโปรเจค

namespace MaJerGan.Services // ✅ เปลี่ยนเป็น namespace ของโปรเจค
{
    public class ChatWebSocketService
    {
        private static readonly ConcurrentDictionary<string, List<WebSocket>> RoomConnections = new();
        private readonly ApplicationDbContext _dbContext;
        private readonly UserManager<User> _userManager;

        public ChatWebSocketService(ApplicationDbContext dbContext, UserManager<User> userManager)
        {
            _dbContext = dbContext;
            _userManager = userManager;
        }

        public async Task HandleWebSocketAsync(HttpContext context)
        {
            if (!context.WebSockets.IsWebSocketRequest)
            {
                context.Response.StatusCode = 400;
                return;
            }

            // ✅ ดึง `UserId` จาก Authentication Claims
            var userIdClaim = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                Console.WriteLine($"❌ User not authenticated");
                context.Response.StatusCode = 401; // Unauthorized
                await context.Response.WriteAsync("❌ User not authenticated");
                return;
            }

            int userId = int.Parse(userIdClaim.Value);
            Console.WriteLine($"🆔 Authenticated User ID: {userId}");

            // ✅ ดึง `EventId` จาก Query String (ส่ง `eventId` จาก Client)
            var eventIdString = context.Request.Query["eventId"];
            if (string.IsNullOrEmpty(eventIdString) || !int.TryParse(eventIdString, out int eventId))
            {
                Console.WriteLine($"❌ Invalid Event ID");
                context.Response.StatusCode = 400;
                await context.Response.WriteAsync("❌ Invalid Event ID");
                return;
            }

            var eventEntity = await _dbContext.Events.FindAsync(eventId); // ✅ ค้นหากิจกรรมจาก Database
            if (eventEntity == null)
            {
                Console.WriteLine($"❌ Event ID {eventId} not found");
                context.Response.StatusCode = 404;
                await context.Response.WriteAsync("❌ Event not found");
                return;
            }

            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                context.Response.StatusCode = 400;
                await context.Response.WriteAsync("User not found.");
                return;
            }

            var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            Console.WriteLine($"✅ {user.Username} connected to Event {eventId}");

            if (!RoomConnections.ContainsKey(eventId.ToString()))
            {
                RoomConnections[eventId.ToString()] = new List<WebSocket>();
            }
            RoomConnections[eventId.ToString()].Add(webSocket);

            var buffer = new byte[1024 * 4];

            try
            {
                while (webSocket.State == WebSocketState.Open)
                {
                    var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                    if (result.MessageType == WebSocketMessageType.Close) break;

                    string receivedMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    Console.WriteLine($"📩 {user.Username} in Event {eventId}: {receivedMessage}");

                    var message = new Message
                    {
                        UserId = user.Id,
                        EventId = eventId,
                        Content = receivedMessage,
                        SentAt = DateTime.UtcNow
                    };

                    _dbContext.Messages.Add(message);
                    await _dbContext.SaveChangesAsync();

                    await BroadcastMessageAsync(eventId.ToString(), user.Username, receivedMessage);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ WebSocket Error: {ex.Message}");
            }
            finally
            {
                RoomConnections[eventId.ToString()].Remove(webSocket);
                Console.WriteLine($"❌ {user.Username} left Event {eventId}");
                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
            }
        }

        private async Task BroadcastMessageAsync(string eventId, string sender, string message)
        {
            if (!RoomConnections.ContainsKey(eventId)) return;

            var chatMessage = new { SenderId = sender, Message = message };
            string jsonMessage = JsonConvert.SerializeObject(chatMessage);

            var tasks = RoomConnections[eventId]
                .Where(ws => ws.State == WebSocketState.Open)
                .Select(async ws =>
                {
                    var bytes = Encoding.UTF8.GetBytes(jsonMessage);
                    await ws.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None);
                });

            await Task.WhenAll(tasks);
        }
    }
}
