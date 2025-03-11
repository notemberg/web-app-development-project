using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace MaJerGan.Middleware
{
    public class NotificationWebSocketHandler
    {
        private static readonly Dictionary<string, WebSocket> _userSockets = new Dictionary<string, WebSocket>();

        public async Task Handle(HttpContext context, WebSocket webSocket, string userId)
        {
            Console.WriteLine($"✅ User {userId} กำลังเชื่อมต่อ WebSocket...");

            lock (_userSockets)
            {
                _userSockets[userId] = webSocket;
            }

            Console.WriteLine($"✅ User {userId} เชื่อมต่อ WebSocket สำเร็จ!");

            var buffer = new byte[1024 * 4];

            try
            {
                while (webSocket.State == WebSocketState.Open)
                {
                    var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        Console.WriteLine($"❌ User {userId} ปิดการเชื่อมต่อ WebSocket");
                        lock (_userSockets)
                        {
                            _userSockets.Remove(userId);
                        }
                        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed", CancellationToken.None);
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Error ใน WebSocket ของ User {userId}: {ex.Message}");
                lock (_userSockets)
                {
                    _userSockets.Remove(userId);
                }
            }
        }


        // public static async Task SendNotificationToUser(int userId, string message)
        // {
        //     string userIdKey = userId.ToString(); // ✅ แปลงเป็น string เพื่อใช้เป็น Key
        //     Console.WriteLine($"debug {userId}: {message}");
        //     if (_userSockets.ContainsKey(userIdKey) && _userSockets[userIdKey].State == WebSocketState.Open)
        //     {
        //         Console.WriteLine($"📩 Sending notification to user {userId}: {message}");
        //         var buffer = Encoding.UTF8.GetBytes(message);
        //         await _userSockets[userId.ToString()].SendAsync(new ArraySegment<byte>(buffer, 0, buffer.Length), WebSocketMessageType.Text, true, CancellationToken.None);
        //     }
        // }

        public static async Task SendNotificationToUser(int userId, string message)
        {
            string userIdKey = userId.ToString(); // ✅ แปลงเป็น string เพื่อใช้เป็น Key

            Console.WriteLine($"🛠 debug: ส่งแจ้งเตือนให้ UserId {userIdKey}, ข้อความ: {message}");

            // ✅ ตรวจสอบว่ามีการเชื่อมต่อ WebSocket อยู่หรือไม่
            if (!_userSockets.ContainsKey(userIdKey))
            {
                Console.WriteLine($"⚠️ Warning: UserId {userIdKey} ยังไม่ได้เชื่อมต่อ WebSocket");
                return;
            }

            if (_userSockets[userIdKey].State != WebSocketState.Open)
            {
                Console.WriteLine($"⚠️ Warning: WebSocket ของ UserId {userIdKey} ไม่ได้อยู่ในสถานะ Open");
                _userSockets.Remove(userIdKey); // ลบ WebSocket ที่ปิดไปแล้ว
                return;
            }

            // ✅ ถ้า WebSocket เปิดอยู่ ส่งข้อความแจ้งเตือน
            Console.WriteLine($"📩 Sending notification to user {userIdKey}: {message}");
            var buffer = Encoding.UTF8.GetBytes(message);
            await _userSockets[userIdKey].SendAsync(new ArraySegment<byte>(buffer, 0, buffer.Length), WebSocketMessageType.Text, true, CancellationToken.None);
        }

        public static async Task sendUpdateReadNotification(int userId)
        {
            string userIdKey = userId.ToString(); // ✅ แปลงเป็น string เพื่อใช้เป็น Key

            Console.WriteLine($"🛠 debug: ส่งการอัปเดตการอ่านแจ้งเตือนให้ UserId {userIdKey}");

            // ✅ ตรวจสอบว่ามีการเชื่อมต่อ WebSocket อยู่หรือไม่
            if (!_userSockets.ContainsKey(userIdKey))
            {
                Console.WriteLine($"⚠️ Warning: UserId {userIdKey} ยังไม่ได้เชื่อมต่อ WebSocket");
                return;
            }

            if (_userSockets[userIdKey].State != WebSocketState.Open)
            {
                Console.WriteLine($"⚠️ Warning: WebSocket ของ UserId {userIdKey} ไม่ได้อยู่ในสถานะ Open");
                _userSockets.Remove(userIdKey); // ลบ WebSocket ที่ปิดไปแล้ว
                return;
            }

            // ✅ ถ้า WebSocket เปิดอยู่ ส่งข้อความแจ้งเตือน
            Console.WriteLine($"📩 Sending update read notification to user {userIdKey}");
            var buffer = Encoding.UTF8.GetBytes("update-read-notification");
            await _userSockets[userIdKey].SendAsync(new ArraySegment<byte>(buffer, 0, buffer.Length), WebSocketMessageType.Text, true, CancellationToken.None);
        }

    }
}
