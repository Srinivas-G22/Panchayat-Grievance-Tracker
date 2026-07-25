function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <h2>Loading Panchayat Records...</h2>
      <p>Fetching grievances from secure database server</p>
    </div>
  );
}

export default Loading;