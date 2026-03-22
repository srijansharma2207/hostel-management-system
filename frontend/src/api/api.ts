const BASE_URL = "http://127.0.0.1:5000";

export async function getStudents() {
  const res = await fetch(`${BASE_URL}/students`);
  return res.json();
}