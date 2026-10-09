import { db } from '../services/db'
import { command } from '../services/permissions'

export default command('d20', 'everyone', async (_params, ctx) => {
    const displayName = ctx.userDisplayName
    const roll = Math.floor(Math.random() * 20 + 1)
    ctx.say(`${displayName} rolled a ${roll}${roll === 20 ? '! 🎉' : ''}`)

    // track nat 20s and nat 1s for leaderboard
    if (roll === 20 || roll === 1) {
        const insertRoll = db.prepare(
            `INSERT INTO d20_rolls (channel_id, user_id, username, roll, rolled_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )

        insertRoll.run(
            ctx.broadcasterId,
            ctx.userId,
            ctx.userName,
            roll,
            Date.now()
        )
    }
})
