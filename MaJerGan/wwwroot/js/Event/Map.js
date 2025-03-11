document.addEventListener("DOMContentLoaded", function () {
  fetch('/api/Api/get-api-key')
      .then(response => response.json())
      .then(data => {
          if (!data.apiKey) {
              console.error("Error: API Key not found");
              return;
          }

          // โหลด Google Maps API
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places`;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
      })
      .catch(error => console.error('Error fetching API key:', error));
});


document.addEventListener("DOMContentLoaded", function () {
  let map;
  let marker;
  let selectedPlace = null;

  function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 13.7563, lng: 100.5018 },
      zoom: 14,
    });

    const input = document.getElementById("searchBoxLocation");
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.setFields([
      "name",
      "formatted_address",
      "geometry",
      "place_id",
    ]);

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        console.error("ไม่พบข้อมูลสถานที่!");
        return;
      }

      console.log(place);
      selectedPlace = {
        name: place.name,
        address: place.formatted_address,
        place_id: place.place_id,
      };

      if (marker) {
        marker.setMap(null);
      }
      marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
      });

      map.setCenter(place.geometry.location);
      map.setZoom(16);
    });
  }

  document
    .getElementById("choose-location-btn")
    .addEventListener("click", () => {
      document.getElementById("modalContainer").style.display = "block";
    });

  document
    .getElementById("saveLocationButton")
    .addEventListener("click", function (event) {
      event.preventDefault();

      if (!selectedPlace) {
        alert("กรุณาเลือกสถานที่ก่อน!");
        return;
      }

      console.log(selectedPlace);
      getPlaceDetails(selectedPlace.place_id);
      const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${selectedPlace.place_id}`;

      document.getElementById("locationInput").value = googleMapsUrl;

      closeModal();
    });

  function getPlaceDetails(placeId) {
    const service = new google.maps.places.PlacesService(map);
    service.getDetails(
      {
        placeId: placeId,
        fields: [
          "name",
          "formatted_address",
          "geometry",
          "photos",
          "rating",
          "website",
          "opening_hours",
        ],
      },
      function (place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          console.log(place);
          document.getElementById("locationNameInput").value = place.name;
          document.getElementById("locationAddressInput").value =place.formatted_address;
          document.getElementById("locationImageInput").value = place.photos[0].getUrl({
            maxWidth: 400,
            maxHeight: 400,
          });

          displayPlaceDetails(place);
        } else {
          console.error("❌ ไม่สามารถดึงข้อมูลสถานที่ได้:", status);
        }
      }
    );
  }

  function displayPlaceDetails(place) {
    let imageElement = document.getElementById("location-image");

    document.getElementById("location-name").textContent = place.name;
    document.getElementById("location-address").textContent =
      place.formatted_address;

    if (place.photos && place.photos.length > 0) {
      const photoUrl = place.photos[0].getUrl({
        maxWidth: 400,
        maxHeight: 400,
      });
      console.log("🖼️ รูปภาพ URL:", photoUrl);

      // ใช้ฟังก์ชัน retry สำหรับการโหลดภาพ
      retryLoadImage(photoUrl, 3, 1000, imageElement);
    } else {
      console.warn("❌ ไม่มีรูปภาพ!");
      imageElement.src =
        "https://play-lh.googleusercontent.com/-4N8D00C9qm8XtbLUgfDIynM-44nCHHUJmsjZJgZio8Fz3raXpUTYLIkrea5H947i78=w240-h480-rw"; // รูปเริ่มต้น
    }

    document.getElementById("location-info").style.display = "flex";
  }

  // ฟังก์ชัน retry สำหรับการโหลดรูปภาพ
  function retryLoadImage(photoUrl, retries, delay, imageElement) {
    let attempts = 0;

    function tryLoadImage() {
      let img = new Image();
      img.onload = function () {
        imageElement.src = photoUrl;
        document
      };
      img.onerror = function () {
        if (attempts < retries) {
          attempts++;
          console.warn(`❌ การโหลดภาพล้มเหลว, พยายามใหม่ (${attempts}/${retries})`);
          setTimeout(tryLoadImage, delay); // หน่วงเวลา 1 วินาทีแล้วลองโหลดใหม่
        } else {
          console.error("❌ ไม่สามารถโหลดภาพได้หลังจากพยายามหลายครั้ง");
          imageElement.src =
            "https://play-lh.googleusercontent.com/-4N8D00C9qm8XtbLUgfDIynM-44nCHHUJmsjZJgZio8Fz3raXpUTYLIkrea5H947i78=w240-h480-rw"; // รูปสำรอง
          // รีเฟรชภาพหลังจาก 10 วินาที
          setTimeout(() => {
            retryLoadImage(photoUrl, retries, delay, imageElement); // รีเฟรชภาพ
          }, 10000); // หน่วงเวลา 10 วินาที
        }
      };
      img.src = photoUrl;
    }

    tryLoadImage();
  }

  window.onload = initMap;
});

function closeModal() {
  document.getElementById("modalContainer").style.display = "none";
  document.getElementById("searchBoxLocation").value = "";
}
