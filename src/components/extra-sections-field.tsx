'use client';

import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormControl, FormItem, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { PlusCircle, Trash2, LayoutList } from 'lucide-react';

interface ExtraSectionsFieldProps {
  // ملاحظة: نوع الحقل هنا مقصود أن يكون "any" لأن هذا المكوّن يُستخدم
  // مع عدة نماذج مختلفة الشكل (post-job / post-competition / post-immigration)،
  // وتحديد نوع "Control" بشكل صارم يسبب خطأ في فحص الأنواع (Type instantiation)
  // بسبب طريقة عمل التباين (variance) في مكتبة react-hook-form.
  control: any;
  name?: string;
  themeColor?: string;
}

const generateSectionId = () =>
  `section_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function ExtraSectionsField({ control, name = 'extraSections', themeColor }: ExtraSectionsFieldProps) {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-base md:text-lg font-semibold">
        <LayoutList className="h-4 w-4" style={{ color: themeColor }} />
        أقسام إضافية (اختياري)
      </h3>
      <p className="text-sm text-muted-foreground -mt-2">
        أضف أي عدد من الأقسام الإضافية بعنوان ومحتوى من اختيارك، وستظهر في صفحة التفاصيل بنفس الترتيب الذي أضفتها به.
      </p>

      {fields.map((field, index) => (
        <Card key={field.id} className="p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-muted-foreground">القسم {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs text-destructive"
              onClick={() => remove(index)}
            >
              <Trash2 className="ml-1 h-3 w-3" />
              حذف القسم
            </Button>
          </div>
          <FormField
            control={control}
            name={`${name}.${index}.id`}
            render={({ field }) => (
              <input type="hidden" {...field} />
            )}
          />
          <FormField
            control={control}
            name={`${name}.${index}.title`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="عنوان القسم" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.${index}.content`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea placeholder="محتوى القسم" rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => append({ id: generateSectionId(), title: '', content: '' })}
      >
        <PlusCircle className="ml-2 h-4 w-4" />
        إضافة قسم
      </Button>
    </div>
  );
}
