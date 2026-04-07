const CommonLabel = ({ label, required = false, className = "" }) => {
  return (
    <label
      className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
    >
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
};

export default CommonLabel;