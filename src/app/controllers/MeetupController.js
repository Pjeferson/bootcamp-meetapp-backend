import * as Yup from 'yup';
import Meetup from '../models/Meetup';
import { parseISO, isBefore } from 'date-fns';

class MeetupController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
    });

    return res.json(meetups);
  }
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
  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      file_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup does not exists.' });
    }

    if (meetup.user_id != req.userId) {
      return res.status(401).json({ error: 'You have not authorization.' });
    }

    //Validate date
    if (isBefore(meetup.date, new Date())) {
      return res
        .status(400)
        .json({ error: 'Edit past meetups are not permitted.' });
    }

    const { title, description, location, date, file_id } = req.body;

    //Validate new date
    if (date && isBefore(parseISO(date), new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted.' });
    }

    await meetup.update({ title, description, location, date, file_id });

    return res.json(meetup);
  }
  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup does not exists.' });
    }

    if (meetup.user_id != req.userId) {
      return res.status(401).json({ error: 'You have not authorization.' });
    }

    //Validate date
    if (isBefore(meetup.date, new Date())) {
      return res
        .status(400)
        .json({ error: 'Delete past meetups are not permitted.' });
    }

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
