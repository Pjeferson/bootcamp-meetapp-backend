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
        meetup: meetup.User.email,
        user: user.email,
        email: user.email,
      },
    });
  }
}

export default new SubscriptionMail();
