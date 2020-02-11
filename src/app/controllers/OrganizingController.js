import Meetup from '../models/Meetup';
import File from '../models/File';

class OrganizingController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
      include: [
        { model: File, as: 'banner', attributes: ['id', 'path', 'url'] },
      ],
    });

    return res.json(meetups);
  }
  async show(req, res) {}
  async store(req, res) {}
  async update(req, res) {}
  async delete(req, res) {}
}

export default new OrganizingController();
