
document.addEventListener('DOMContentLoaded', function() {
    const tagContainer = document.querySelectorAll('.tags-container');
    
    tagContainer.forEach(function(container) {
        const tags = container.querySelectorAll('.tag-button');
        const maxTags = 5; // ตั้งค่าให้แสดง 3 tag ก่อน ถ้ามีมากกว่านั้นจะซ่อนไว้
        const tagCount = tags.length;

        if (tagCount > maxTags) {
            let moreTag = document.createElement('span');
            moreTag.classList.add('span-more-tag');
            moreTag.innerHTML = `+${tagCount - maxTags} more`;
            // moreTag.style.background = '#ccc'; // ใส่สีที่เหมาะสม
            container.appendChild(moreTag);

            for (let i = maxTags; i < tagCount; i++) {
                tags[i].style.display = 'none'; // ซ่อน tag ที่เกิน
            }
        }
    });
});