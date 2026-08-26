import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProperty, getProperty, updateProperty } from '../api/properties';
import type { PropertyType, PropertyStatus } from '../api/properties';
import { Button } from '../components/Button';
import { TextField, SelectField, TextAreaField, FormRow } from '../components/FormField';
import listStyles from '../styles/listPage.module.css';
import styles from './PropertyFormPage.module.css';

const PROPERTY_TYPES: PropertyType[] = ['Apartment', 'Studio', 'Townhouse', 'Office', 'Retail'];
const PROPERTY_STATUSES: PropertyStatus[] = ['Occupied', 'Vacant', 'Maintenance', 'Archived'];

const baseSchema = z.object({
  code: z.string().max(20),
  name: z.string().min(1, 'Name is required').max(120),
  address: z.string().min(1, 'Address is required').max(200),
  city: z.string().min(1, 'City is required').max(80),
  district: z.string().min(1, 'District is required').max(80),
  type: z.enum(PROPERTY_TYPES),
  status: z.enum(PROPERTY_STATUSES),
  monthlyRent: z.number().positive('Monthly rent must be greater than 0'),
  size: z.number().positive('Size must be greater than 0'),
  rooms: z.number().int().min(0, 'Rooms cannot be negative'),
  floor: z.number().int(),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof baseSchema>;

function buildSchema(isEdit: boolean) {
  return baseSchema.superRefine((data, ctx) => {
    if (!isEdit && data.code.trim().length === 0) {
      ctx.addIssue({ code: 'custom', path: ['code'], message: 'Code is required' });
    }
  });
}

export function PropertyFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const propertyQuery = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id!),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(buildSchema(isEdit)),
    values: propertyQuery.data
      ? {
          code: propertyQuery.data.code,
          name: propertyQuery.data.name,
          address: propertyQuery.data.address,
          city: propertyQuery.data.city,
          district: propertyQuery.data.district,
          type: propertyQuery.data.type,
          status: propertyQuery.data.status,
          monthlyRent: propertyQuery.data.monthlyRent,
          size: propertyQuery.data.size,
          rooms: propertyQuery.data.rooms,
          floor: propertyQuery.data.floor,
          description: propertyQuery.data.description ?? '',
        }
      : undefined,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { code, ...rest } = values;
      if (isEdit) {
        return updateProperty(id!, { ...rest, description: rest.description || null });
      }
      return createProperty({ ...rest, code, description: rest.description || null });
    },
    onSuccess: (property) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', property.id] });
      navigate(`/properties/${property.id}`);
    },
    onError: (error: unknown) => {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save property.');
    },
  });

  if (isEdit && propertyQuery.isLoading) return <p>Loading…</p>;
  if (isEdit && propertyQuery.isError) return <p role="alert">Failed to load property.</p>;

  return (
    <section>
      <div className={listStyles.header}>
        <div>
          <p className={listStyles.eyebrow}>{isEdit ? 'EDIT PROPERTY' : 'NEW PROPERTY'}</p>
          <h1 className={listStyles.title}>{isEdit ? propertyQuery.data?.name : 'Add a property'}</h1>
        </div>
      </div>

      <form
        className={styles.form}
        onSubmit={handleSubmit((values) => {
          setSubmitError(null);
          mutation.mutate(values);
        })}
        noValidate
      >
        {submitError && (
          <p role="alert" className={styles.formError}>
            {submitError}
          </p>
        )}

        <FormRow>
          <TextField id="code" label="Code" disabled={isEdit} error={errors.code?.message} {...register('code')} />
          <TextField id="name" label="Name" error={errors.name?.message} {...register('name')} />
        </FormRow>

        <TextField id="address" label="Address" error={errors.address?.message} {...register('address')} />

        <FormRow>
          <TextField id="city" label="City" error={errors.city?.message} {...register('city')} />
          <TextField id="district" label="District" error={errors.district?.message} {...register('district')} />
        </FormRow>

        <FormRow>
          <SelectField
            id="type"
            label="Type"
            error={errors.type?.message}
            options={PROPERTY_TYPES.map((t) => ({ value: t, label: t }))}
            {...register('type')}
          />
          <SelectField
            id="status"
            label="Status"
            error={errors.status?.message}
            options={PROPERTY_STATUSES.map((s) => ({ value: s, label: s }))}
            {...register('status')}
          />
        </FormRow>

        <FormRow>
          <TextField
            id="monthlyRent"
            label="Monthly Rent (NT$)"
            type="number"
            step="1"
            error={errors.monthlyRent?.message}
            {...register('monthlyRent', { valueAsNumber: true })}
          />
          <TextField
            id="size"
            label="Size (m²)"
            type="number"
            step="0.1"
            error={errors.size?.message}
            {...register('size', { valueAsNumber: true })}
          />
        </FormRow>

        <FormRow>
          <TextField
            id="rooms"
            label="Rooms"
            type="number"
            step="1"
            error={errors.rooms?.message}
            {...register('rooms', { valueAsNumber: true })}
          />
          <TextField
            id="floor"
            label="Floor"
            type="number"
            step="1"
            error={errors.floor?.message}
            {...register('floor', { valueAsNumber: true })}
          />
        </FormRow>

        <TextAreaField id="description" label="Description" error={errors.description?.message} {...register('description')} />

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            size="medium"
            onClick={() => {
              reset();
              navigate(isEdit ? `/properties/${id}` : '/properties');
            }}
          >
            Cancel
          </Button>
          <Button type="submit" size="medium" disabled={isSubmitting || mutation.isPending}>
            {isEdit ? 'Save changes' : 'Create property'}
          </Button>
        </div>
      </form>
    </section>
  );
}
