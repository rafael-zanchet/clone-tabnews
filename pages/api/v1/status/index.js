function status(request, response) {
  response.status(200).json({ chave: "success" });
}

export default status;
