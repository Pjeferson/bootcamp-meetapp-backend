import * as Yup from 'yup';
import Meetup from '../models/Meetup';
import { parseISO, startOfHour, isBefore } from 'date-fns';

class MeetupController {
  async index(req, res) {}
  async show(req, res) {}
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      file_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { title, description, location, date, file_id } = req.body;

    //Validate date
    if (isBefore(parseISO(date), new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted.' });
    }

    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      file_id,
      user_id: req.userId,
    });

    return res.json(meetup);
  }
  async delete(req, res) {}
}

export default new MeetupController();
