import { Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  //TODO -   will reomve undefined in later
  id: number | undefined
}
