using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MaJerGan.Data;
using MaJerGan.Models;
using System.Net.WebSockets;
using MaJerGan.Middleware;
using MaJerGan.Services;
using MaJerGan.Hubs;
using MaJerGan.Repositories;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

Env.Load();
var apiKey = Environment.GetEnvironmentVariable("GOOGLE_MAPS_API_KEY");
Console.WriteLine($"Loaded API Key: {apiKey}"); // Debug ตรวจสอบค่า


builder.Configuration.AddEnvironmentVariables();
builder.Services.AddHostedService<EventCleanupService>();
// builder.Services.AddHostedService<EventImageUpdateService>(); // อัปเดตรูปภาพทุก 24 ชั่วโมง

builder.Services.AddSingleton<EmailService>();
builder.Services.AddSingleton<CloudinaryService>();
// ✅ ลงทะเบียน WebSocket Handler
builder.Services.AddSingleton<NotificationWebSocketHandler>();



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
builder.Services.AddScoped<NotificationRepository>();

var app = builder.Build();

// ✅ ตั้งค่า Error Handling
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

// ✅ ลงทะเบียน Repository

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

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/ws-notification" && context.Request.Query.ContainsKey("userId"))
    {
        var userId = context.Request.Query["userId"];
        if (context.WebSockets.IsWebSocketRequest)
        {
            var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            var handler = context.RequestServices.GetRequiredService<NotificationWebSocketHandler>();
            await handler.Handle(context, webSocket, userId);
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
