import { DataSource } from 'typeorm'

export const truncateTables = async (connection: DataSource) => {
  const entities = connection.entityMetadatas

  for (const entity of entities) {
    const repository = connection.getRepository(entity.name)
    await repository.clear()
  }
}

export const isJwt = (token: string | null) => {
  try {
    if (token === null) {
      return false
    }

    const parts = token.split('.')

    if (parts.length < 3) {
      return false
    }

    parts.forEach((base64Part) => {
      Buffer.from(base64Part, 'base64').toString('utf-8')
    })

    return true
  } catch (error) {
    return false
  }
}
