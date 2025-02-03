const Error = () => {
  const cleanStorage = () => {
    chrome.storage.local.clear();
  };

  return (
    <div className="my-6">
      <p>Error occured</p>
      <p>Try to clean storage to fix this issue</p>
      <button onClick={cleanStorage} className="mt-3 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
        Clear Storage
      </button>
    </div>
  );
};

export default Error;
