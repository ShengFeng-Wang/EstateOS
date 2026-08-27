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
import { useTranslation } from '../i18n/useTranslation';
import type { Translations } from '../i18n/translations';
import listStyles from '../styles/listPage.module.css';
import styles from './PropertyFormPage.module.css';

const PROPERTY_TYPES: PropertyType[] = ['Apartment', 'Studio', 'Townhouse', 'Office', 'Retail'];
const PROPERTY_STATUSES: PropertyStatus[] = ['Occupied', 'Vacant', 'Maintenance', 'Archived'];

function buildSchema(isEdit: boolean, t: Translations) {
  const errors = t.properties.form.errors;
  return z
    .object({
      code: z.string().max(20),
      name: z.string().min(1, errors.nameRequired).max(120),
      address: z.string().min(1, errors.addressRequired).max(200),
      city: z.string().min(1, errors.cityRequired).max(80),
      district: z.string().min(1, errors.districtRequired).max(80),
      type: z.enum(PROPERTY_TYPES),
      status: z.enum(PROPERTY_STATUSES),
      monthlyRent: z.number().positive(errors.rentPositive),
      size: z.number().positive(errors.sizePositive),
      rooms: z.number().int().min(0, errors.roomsMin),
      floor: z.number().int(),
      description: z.string().max(500).optional(),
    })
    .superRefine((data, ctx) => {
      if (!isEdit && data.code.trim().length === 0) {
        ctx.addIssue({ code: 'custom', path: ['code'], message: errors.codeRequired });
      }
    });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export function PropertyFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const f = t.properties.form;

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
    resolver: zodResolver(buildSchema(isEdit, t)),
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
      setSubmitError(error instanceof Error ? error.message : f.genericError);
    },
  });

  if (isEdit && propertyQuery.isLoading) return <p>{t.common.loading}</p>;
  if (isEdit && propertyQuery.isError) return <p role="alert">{f.failed}</p>;

  return (
    <section>
      <div className={listStyles.header}>
        <div>
          <p className={listStyles.eyebrow}>{isEdit ? f.editEyebrow : f.newEyebrow}</p>
          <h1 className={listStyles.title}>{isEdit ? propertyQuery.data?.name : f.newTitle}</h1>
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
          <TextField id="code" label={f.fields.code} disabled={isEdit} error={errors.code?.message} {...register('code')} />
          <TextField id="name" label={f.fields.name} error={errors.name?.message} {...register('name')} />
        </FormRow>

        <TextField id="address" label={f.fields.address} error={errors.address?.message} {...register('address')} />

        <FormRow>
          <TextField id="city" label={f.fields.city} error={errors.city?.message} {...register('city')} />
          <TextField id="district" label={f.fields.district} error={errors.district?.message} {...register('district')} />
        </FormRow>

        <FormRow>
          <SelectField
            id="type"
            label={f.fields.type}
            error={errors.type?.message}
            options={PROPERTY_TYPES.map((type) => ({ value: type, label: t.propertyType[type] }))}
            {...register('type')}
          />
          <SelectField
            id="status"
            label={f.fields.status}
            error={errors.status?.message}
            options={PROPERTY_STATUSES.map((status) => ({ value: status, label: t.propertyStatus[status] }))}
            {...register('status')}
          />
        </FormRow>

        <FormRow>
          <TextField
            id="monthlyRent"
            label={f.fields.monthlyRent}
            type="number"
            step="1"
            error={errors.monthlyRent?.message}
            {...register('monthlyRent', { valueAsNumber: true })}
          />
          <TextField
            id="size"
            label={f.fields.size}
            type="number"
            step="0.1"
            error={errors.size?.message}
            {...register('size', { valueAsNumber: true })}
          />
        </FormRow>

        <FormRow>
          <TextField
            id="rooms"
            label={f.fields.rooms}
            type="number"
            step="1"
            error={errors.rooms?.message}
            {...register('rooms', { valueAsNumber: true })}
          />
          <TextField
            id="floor"
            label={f.fields.floor}
            type="number"
            step="1"
            error={errors.floor?.message}
            {...register('floor', { valueAsNumber: true })}
          />
        </FormRow>

        <TextAreaField id="description" label={f.fields.description} error={errors.description?.message} {...register('description')} />

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
            {t.common.cancel}
          </Button>
          <Button type="submit" size="medium" disabled={isSubmitting || mutation.isPending}>
            {isEdit ? t.common.save : f.createSubmit}
          </Button>
        </div>
      </form>
    </section>
  );
}
