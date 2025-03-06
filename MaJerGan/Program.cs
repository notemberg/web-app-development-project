using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MaJerGan.Data;
using MaJerGan.Models;
using System.Net.WebSockets;
using MaJerGan.Middleware;
using MaJerGan.Services;
using MaJerGan.Hubs;

var builder = WebApplication.CreateBuilder(args);



builder.Services.AddHostedService<EventCleanupService>();
builder.Services.AddSingleton<EmailService>();
builder.Services.AddSingleton<CloudinaryService>();


builder.Services.AddDistributedMemoryCache(); // ใช้ In-Memory Cache สำหรับ Session
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // กำหนด Timeout 30 นาที
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Login";
});


builder.Services.AddAuthentication("MyCookieAuth")
    .AddCookie("MyCookieAuth", options =>
    {
        options.LoginPath = "/Auth/Login";
        options.LogoutPath = "/Auth/Logout";
        options.AccessDeniedPath = "/Auth/AccessDenied";
        options.Cookie.Name = "MyCookieAuth"; // ตั้งชื่อคุกกี้
        options.Cookie.HttpOnly = true;
        // options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // เปลี่ยนเป็น `.None` ถ้าใช้ HTTP
        options.Cookie.SecurePolicy = CookieSecurePolicy.None;
    });

builder.Services.AddAuthorization();


// ✅ ตั้งค่า Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ✅ ตั้งค่า Identity
// builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
//     .AddEntityFrameworkStores<ApplicationDbContext>()
//     .AddDefaultTokenProviders();

// ✅ เพิ่ม Controllers & Views
builder.Services.AddControllersWithViews();

var app = builder.Build();

// ✅ ตั้งค่า Error Handling
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
// ✅ ตั้งค่า Static Files (เพื่อโหลด CSS, JS, Images)
app.UseHttpsRedirection();
app.UseStaticFiles();  // ❗ ต้องมี เพื่อให้ CSS ทำงาน

app.UseRouting();

app.UseSession();

app.UseAuthentication();
app.UseAuthorization();



app.UseWebSockets();
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/ws")
    {
        if (context.WebSockets.IsWebSocketRequest)
        {
            WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
            var handler = new WebSocketHandler();
            await handler.Handle(context, webSocket);
        }
        else
        {
            context.Response.StatusCode = 400;
        }
    }
    else
    {
        await next();
    }
});




// ✅ ตั้งค่า Default Route
// app.MapControllerRoute(
//     name: "create_event",
//     pattern: "Create",
//     defaults: new { controller = "Event", action = "Create" }
// );

// ✅ ตั้งค่า Default Route (ควรอยู่ล่างสุด)
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");


app.Run();
