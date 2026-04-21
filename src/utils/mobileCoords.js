export function getMobilePosition(position) {
  const [x, y, z] = position;
  // Bóp chiều ngang (X) nhiều hơn để sao không bị tràn ra viền điện thoại
  // Và kéo dãn nhẹ chiều dọc (Y) để các ngôi sao không bị đè lên nhau
  const scaleX = 0.45;
  const scaleY = 0.9;
  return [x * scaleX, y * scaleY, z];
}
