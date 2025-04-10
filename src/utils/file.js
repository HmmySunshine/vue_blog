/**
 * 根据文件类型获取对应的图标类名
 * @param {string} fileType MIME类型
 * @returns {string} FontAwesome图标类名
 */
export function getFileIcon(fileType) {
  const iconMap = {
    "application/pdf": "fas fa-file-pdf",
    "application/zip": "fas fa-file-archive",
    "image/jpeg": "fas fa-file-image",
    "image/png": "fas fa-file-image",
    "text/plain": "fas fa-file-alt",
    "application/msword": "fas fa-file-word",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "fas fa-file-word",
    "application/vnd.ms-excel": "fas fa-file-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "fas fa-file-excel",
    "application/vnd.ms-powerpoint": "fas fa-file-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "fas fa-file-powerpoint",
  };
  return iconMap[fileType] || "fas fa-file";
}