using Microsoft.AspNetCore.SignalR;
using MaJerGan.Data;
using MaJerGan.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MaJerGan.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;

        public ChatHub(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SendMessage(int eventId, string userName, string message)
        {
            // ✅ บันทึกลง Database
            var chatMessage = new Message
            {
                EventId = eventId,
                UserId = _context.Users.FirstOrDefault(u => u.Username == userName)?.Id ?? 0, // หาค่า UserId
                Content = message,
                SentAt = DateTime.Now
            };

            _context.Messages.Add(chatMessage);
            await _context.SaveChangesAsync();

            // ✅ ส่งข้อความให้ทุกคนในห้องแชท
            await Clients.Group(eventId.ToString()).SendAsync("ReceiveMessage", userName, message);
        }

        public async Task JoinEventChat(int eventId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, eventId.ToString());
        }

        public async Task LeaveEventChat(int eventId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, eventId.ToString());
        }
    }
}
