import File from '../models/File';

class FileController {
  async index(req, res) {}
  async show(req, res) {}
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;
    console.log(name, path);

    const file = await File.create({ name, path });

    return res.json(file);
  }
  async delete(req, res) {}
}

export default new FileController();
