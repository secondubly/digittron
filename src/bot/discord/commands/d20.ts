import { createCommand } from 'arcscord';


export default createCommand({
  slash: { name: "d20", description: "Roll a d20" },
  run: (ctx) => {
    // TODO: setup d20 tracking for discord bot
    const roll = Math.floor(Math.random() * 20 + 1)
    return ctx.reply(`You rolled a ${roll}${roll === 20 ? '! 🎉' : ''}`)
  }
});
