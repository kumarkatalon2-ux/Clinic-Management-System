import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  createdBy?: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  updatedBy?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
