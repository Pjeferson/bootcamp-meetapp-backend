import Meetup from '../models/Meetup';

class OrganizingController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
    });

    return res.json(meetups);
  }
  async show(req, res) {}
  async store(req, res) {}
  async update(req, res) {}
  async delete(req, res) {}
}

export default new OrganizingController();
