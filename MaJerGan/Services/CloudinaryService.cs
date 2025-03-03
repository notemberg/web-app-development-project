using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading.Tasks;

namespace MaJerGan.Services
{
    public class CloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IConfiguration configuration)
        {
            var cloudName = configuration["Cloudinary:CloudName"];
            var apiKey = configuration["Cloudinary:ApiKey"];
            var apiSecret = configuration["Cloudinary:ApiSecret"];

            Console.WriteLine($"Cloudinary Config - CloudName: {cloudName}, API Key: {apiKey}");

            if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
            {
                throw new ArgumentException("Cloudinary settings are missing in appsettings.json!");
            }

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }


        public async Task<string> UploadImageAsync(Stream fileStream, string fileName)
        {
            try
            {
                Console.WriteLine("Uploading image to Cloudinary...(service)");

                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(fileName, fileStream), // ✅ กำหนดไฟล์และชื่อไฟล์
                    Folder = "profile-pictures", // ✅ เก็บรูปในโฟลเดอร์ profile-pictures บน Cloudinary
                    PublicId = Guid.NewGuid().ToString(), // ✅ ตั้งชื่อไฟล์เป็น UUID ป้องกันชื่อซ้ำ
                    Overwrite = true
                };

                Console.WriteLine($"Uploading file(service): {fileName}");

                var uploadResult = await _cloudinary.UploadAsync(uploadParams); // ✅ ส่งรูปไป Cloudinary

                if (uploadResult == null)
                {
                    Console.WriteLine("Error: Cloudinary upload result is null!");
                    return null;
                }

                Console.WriteLine($"Upload result(service): {uploadResult.StatusCode}");
                if (string.IsNullOrEmpty(uploadResult.SecureUrl.AbsoluteUri))
                {
                    Console.WriteLine("Error: Upload to Cloudinary failed, no URL returned!");
                    return null;
                }
            

                Console.WriteLine($"Image uploaded successfully(service): {uploadResult.SecureUrl.AbsoluteUri}");
                return uploadResult.SecureUrl.AbsoluteUri; // ✅ ส่ง URL ของรูปกลับ
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Cloudinary Upload Error: {ex.Message}");
                return null;
            }
        }

        // ✅ เพิ่มฟังก์ชันลบรูปเก่า
        public async Task<bool> DeleteImageAsync(string publicId)
        {
            if (string.IsNullOrEmpty(publicId)) return false;

            var deletionParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deletionParams);

            return result.Result == "ok";
        }

    }
}
