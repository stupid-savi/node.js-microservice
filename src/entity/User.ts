import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Tenant } from './Tenant'

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string
  @Column()
  firstname: string

  @Column()
  lastname: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column()
  role: string

  @ManyToOne(() => Tenant)
  tenant: Tenant

  @UpdateDateColumn()
  updatedAt: Date

  @CreateDateColumn()
  createdAt: Date
}
