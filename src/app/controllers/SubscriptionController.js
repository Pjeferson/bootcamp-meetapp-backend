import * as Yup from 'yup';
import { Op } from 'sequelize';
import { isBefore } from 'date-fns';

import User from '../models/User';
import Meetup from '../models/Meetup';
import File from '../models/File';
import Subscription from '../models/Subscription';
import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          where: {
            //required isn't necessary
            date: {
              [Op.gt]: new Date(),
            },
          },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
            },
            {
              model: File,
              as: 'banner',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
      order: [['meetup', 'date', 'asc']],
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

    const user = await User.findByPk(req.userId);
    const meetup = await Meetup.findByPk(meetup_id, {
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

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

    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });

    return res.json(subscription);
  }
  async update(req, res) {}
  async delete(req, res) {}
}

export default new SubscriptionController();
