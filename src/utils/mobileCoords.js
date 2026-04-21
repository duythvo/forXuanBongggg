export function getMobilePosition(id, defaultPos) {
  // Sắp xếp zigzag từ trên xuống dưới cho điện thoại dọc (Portrait)
  // Đảm bảo không bao giờ đè lên nhau dù ngôi sao có to gấp 2, 3 lần
  const map = {
    1: [ 1.6,  3.4, -1.0], // Trên cùng phải
    2: [-1.6,  1.7,  0.5], // Trái
    5: [ 1.6,  0.0, -2.0], // Phải
    4: [-1.6, -1.7, -1.5], // Trái
    3: [ 1.2, -3.4,  1.2], // Dưới cùng phải
  };
  return map[id] || defaultPos;
}
