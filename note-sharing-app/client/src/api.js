const API_URL = process.env.REACT_APP_API_URL;

export const fetchNotes = async () => {
  const response = await fetch(`${API_URL}/notes`);
  return response.json();
};
