const Spinner = ({ text = "Loading…" }) => {
  return (
    <div className="text-center" role="status" aria-live="polite">
      <div
        className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"
        aria-hidden="true"
      ></div>
      <p className="text-gray-600">{text}</p>
    </div>
  );
};

export default Spinner;
