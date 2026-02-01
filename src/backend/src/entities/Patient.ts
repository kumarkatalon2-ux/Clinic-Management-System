import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';

export enum BloodType {
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
}

@Entity('patients')
@Index(['email', 'tenantId'], { unique: true })
@Index(['mrn', 'tenantId'], { unique: true })
@Index(['dateOfBirth'])
export class Patient extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  mrn!: string; // Medical Record Number

  @Column({ type: 'varchar', length: 255 })
  firstName!: string;

  @Column({ type: 'varchar', length: 255 })
  lastName!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'date' })
  dateOfBirth!: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ssn?: string;

  @Column({ type: 'varchar', length: 10 })
  gender!: string; // 'male', 'female', 'other'

  @Column({
    type: 'enum',
    enum: BloodType,
    nullable: true,
  })
  bloodType?: BloodType;

  @Column({
    type: 'enum',
    enum: MaritalStatus,
    nullable: true,
  })
  maritalStatus?: MaritalStatus;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  emergencyContact?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  emergencyContactPhone?: string;

  @Column({ type: 'text', nullable: true })
  medicalHistory?: string;

  @Column({ type: 'text', nullable: true })
  allergies?: string;

  @Column({ type: 'text', nullable: true })
  currentMedications?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  insuranceProvider?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  insurancePolicyNumber?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  primaryCarePhysician?: string;

  @Column({ type: 'uuid', nullable: true })
  clinicId?: string;

  @Column({ type: 'boolean', default: false })
  isDeceased!: boolean;

  @Column({ type: 'date', nullable: true })
  dateOfDeath?: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  profilePicture?: string;

  @Column({ type: 'json', nullable: true })
  customFields?: Record<string, any>;

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  getAge(): number {
    const today = new Date();
    let age = today.getFullYear() - this.dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - this.dateOfBirth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.dateOfBirth.getDate())) {
      age--;
    }
    
    return age;
  }
}
