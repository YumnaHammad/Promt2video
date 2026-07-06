"use server";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

interface TemplateForm {
  name: string;
  slug: string;
  category: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  isPremium: boolean;
}

export async function createTemplate(form: TemplateForm) {
  const admin = await requireAdmin();

  const slug = form.slug || slugify(form.name);

  const template = await db.template.create({
    data: {
      name: form.name,
      slug,
      description: form.description || `${form.name} template`,
      category: form.category,
      tags: [],
      thumbnailUrl: form.thumbnailUrl || "/placeholder-template.jpg",
      isPremium: form.isPremium,
      price: form.price,
      remotionData: {},
      isPublished: false,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      isPremium: true,
      isPublished: true,
      price: true,
      downloads: true,
      rating: true,
      sceneCount: true,
      duration: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: "TEMPLATE_CREATED",
      entity: "Template",
      entityId: template.id,
    },
  });

  revalidatePath("/admin/templates");
  return template;
}

export async function updateTemplate(id: string, form: TemplateForm) {
  const admin = await requireAdmin();

  const template = await db.template.update({
    where: { id },
    data: {
      name: form.name,
      slug: form.slug || slugify(form.name),
      category: form.category,
      thumbnailUrl: form.thumbnailUrl || undefined,
      isPremium: form.isPremium,
      price: form.price,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      isPremium: true,
      isPublished: true,
      price: true,
      downloads: true,
      rating: true,
      sceneCount: true,
      duration: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: "TEMPLATE_UPDATED",
      entity: "Template",
      entityId: id,
    },
  });

  revalidatePath("/admin/templates");
  return template;
}

export async function deleteTemplate(id: string) {
  const admin = await requireAdmin();

  await db.template.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: "TEMPLATE_DELETED",
      entity: "Template",
      entityId: id,
    },
  });

  revalidatePath("/admin/templates");
}

export async function toggleTemplatePublished(id: string) {
  const admin = await requireAdmin();

  const current = await db.template.findUnique({
    where: { id },
    select: { isPublished: true },
  });

  if (!current) throw new Error("Template not found");

  const template = await db.template.update({
    where: { id },
    data: { isPublished: !current.isPublished },
    select: { id: true, isPublished: true },
  });

  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: template.isPublished ? "TEMPLATE_PUBLISHED" : "TEMPLATE_UNPUBLISHED",
      entity: "Template",
      entityId: id,
    },
  });

  revalidatePath("/admin/templates");
  return template;
}
