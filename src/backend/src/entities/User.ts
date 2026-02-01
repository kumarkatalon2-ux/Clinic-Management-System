import {
  Entity,
  Column,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  RECEPTIONIST = 'receptionist',
  PATIENT = 'patient',
  PHARMACIST = 'pharmacist',
  LAB_TECHNICIAN = 'lab_technician',
}

@Entity('users')
@Index(['email', 'tenantId'], { unique: true })
@Unique('UQ_user_email_tenant', ['email', 'tenantId'])
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  firstName!: string;

  @Column({ type: 'varchar', length: 255 })
  lastName!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role!: UserRole;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'uuid', nullable: true })
  clinicId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  specialization?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  licenseNumber?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column({ type: 'boolean', default: true })
  isEmailVerified!: boolean;

  @Column({ type: 'boolean', default: true })
  isPhoneVerified!: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  profilePicture?: string;

  @Column({ type: 'text', nullable: true })
  biography?: string;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  twoFactorSecret?: string;

  @Column({ type: 'json', nullable: true })
  permissions?: string[];

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
