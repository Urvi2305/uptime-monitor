function StatusBadge({ isUp }) {
  if (isUp === null || isUp === undefined) {
    return <span className="badge badge-pending">PENDING</span>;
  }

  return isUp ? (
    <span className="badge badge-up">UP</span>
  ) : (
    <span className="badge badge-down">DOWN</span>
  );
}

export default StatusBadge;
