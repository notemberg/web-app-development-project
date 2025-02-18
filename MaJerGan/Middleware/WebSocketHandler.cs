using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace MaJerGan.Middleware // ✅ เปลี่ยนเป็น namespace ของโปรเจค
{
    public class WebSocketHandler
    {
        private static readonly List<WebSocket> _sockets = new List<WebSocket>();

        public async Task Handle(HttpContext context, WebSocket webSocket)
        {
            lock (_sockets)
            {
                _sockets.Add(webSocket);
            }

            var buffer = new byte[1024 * 4];

            while (webSocket.State == WebSocketState.Open)
            {
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    lock (_sockets)
                    {
                        _sockets.Remove(webSocket);
                    }
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed", CancellationToken.None);
                    break;
                }
            }
        }

        public static async Task BroadcastMessage(string message)
        {
            var buffer = Encoding.UTF8.GetBytes(message);
            var tasks = new List<Task>();

            lock (_sockets)
            {
                foreach (var socket in _sockets)
                {
                    if (socket.State == WebSocketState.Open)
                    {
                        tasks.Add(socket.SendAsync(new ArraySegment<byte>(buffer, 0, buffer.Length), WebSocketMessageType.Text, true, CancellationToken.None));
                    }
                }
            }

            await Task.WhenAll(tasks);
        }
    }
}
