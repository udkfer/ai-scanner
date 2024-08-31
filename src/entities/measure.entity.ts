import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Measure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  datetime: string;

  @Column()
  type: string;

  @Column()
  has_confirmed: boolean;

  @Column()
  image_url: string;

  @Column()
  customer_code: string;

  @Column()
  measured_value: number;
}
