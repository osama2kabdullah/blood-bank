/**
 * All 64 Districts of Bangladesh
 * Grouped by Division for better organization
 */

export interface BloodGroups {
  label: string;
  value: string;
}

const BLOOD_GROUPS: BloodGroups[] = [
  { label: 'A+', value: 'a+' },
  { label: 'A-', value: 'a-' },
  { label: 'B+', value: 'b+' },
  { label: 'B-', value: 'b-' },
  { label: 'AB+', value: 'ab+' },
  { label: 'AB-', value: 'ab-' },
  { label: 'O+', value: 'o+' },
  { label: 'O-', value: 'o-' },
]

export default BLOOD_GROUPS;