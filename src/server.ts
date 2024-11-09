import { CONFIG } from './config'
import app from './app'

console.log(CONFIG.PORT)

const startServer = () => {
  try {
    app.listen(CONFIG.PORT, () =>
      console.log(`Server is running at port ${CONFIG.PORT}`),
    )
  } catch (err) {
    console.error(err)
  }
}

startServer()
