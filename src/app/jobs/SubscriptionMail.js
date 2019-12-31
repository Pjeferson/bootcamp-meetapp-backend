import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    await Mail.sendMail({
      to: `${meetup.User.name} <${meetup.User.email}>`,
      subject: 'Inscrição em Meetup',
      template: 'subscription',
      context: {
        owner: meetup.User.name,
        meetup: meetup.name,
        user: user.name,
        email: user.email,
      },
    });
  }
}

export default new SubscriptionMail();
