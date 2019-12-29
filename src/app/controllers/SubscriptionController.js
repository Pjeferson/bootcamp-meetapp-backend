import * as Yup from 'yup';
import User from '../models/User';
import Meetup from '../models/Meetup';
import { isBefore } from 'date-fns';
import Subscription from '../models/Subscription';
import { Op } from 'sequelize';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          where: {
            //required isn't necessary
            date: {
              [Op.gt]: new Date(),
            },
          },
        },
      ],
      order: [[Meetup, 'date', 'asc']],
    });

    return res.json(subscriptions);
  }
  async show(req, res) {}
  async store(req, res) {
    const schema = Yup.object().shape({
      meetup_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { meetup_id } = req.body;

    const meetup = await Meetup.findByPk(meetup_id);

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup does not exists.' });
    }

    if (meetup.user_id == req.userId) {
      return res
        .status(400)
        .json({ error: 'You can not subscribe to your own meetups.' });
    }

    //Validate date
    if (isBefore(meetup.date, new Date())) {
      return res
        .status(400)
        .json({ error: 'You can not subscribe to past meetups.' });
    }

    const isSubscribed = await Subscription.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          required: true, //This is the default value when a 'where' is used
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (isSubscribed) {
      return res.status(400).json({
        error: 'You can not subscribe to two meetups at the same time.',
      });
    }

    const subscription = await Subscription.create({
      meetup_id,
      user_id: req.userId,
    });

    //Send email here

    return res.json(subscription);
  }
  async update(req, res) {}
  async delete(req, res) {}
}

export default new SubscriptionController();
