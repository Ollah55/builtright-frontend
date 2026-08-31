export async function readLearnerApiResponse(response, fallbackMessage = "The learner service could not be reached.") {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    if (response.status === 404) {
      throw new Error("Learner services are not deployed on the backend yet. Deploy the updated backend before using this page.");
    }
    throw new Error(fallbackMessage);
  }
  const data = await response.json();
  if (!response.ok || !data.status) throw new Error(data.message || fallbackMessage);
  return data;
}
