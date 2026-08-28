import { useCacheManager } from "@/hooks/useCacheManager";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { useGetOneWithParams } from "@/hooks/useGetOneWithParams";
import { EmployeeModel } from "@/model/employee.model";
import { PermissionModel } from "@/model/permission.model";
import { EmployeeService } from "@/services/employee.service";
import { PermissionService } from "@/services/permission.service";
import { App, Form } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IEmployeeCreateForm } from "./types";

interface AvaliablePermissions {
  allAvaliablePermission: PermissionModel[];
  employeeTypeDefaultPermissions: PermissionModel[];
}

const employeeService = new EmployeeService();

export function useEmployeeFormController({ isEdit }: { isEdit?: boolean }) {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const { uid } = useParams();

  const [form] = Form.useForm<IEmployeeCreateForm>();

  const employeeType = Form.useWatch("type", form);

  const permissionService = new PermissionService(`avaliable-permissions`);

  const { data: permissions } = useGetAllWithParams<AvaliablePermissions>(
    permissionService,
    {},
    {
      queryParams: {
        employeeType,
      },
      enabled: !!employeeType,
    },
  );

  const { invalidateQuery } = useCacheManager();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await form.validateFields();
      const values = form.getFieldsValue();
      if (isEdit) {
        await employeeService.update(uid as string, values);
        message.success("Funcionário atualizado com sucesso!");
      } else {
        await employeeService.create(values);
        message.success("Funcionário cadastrado com sucesso!");
      }
      await invalidateQuery(employeeService);
      navigate(-1);
    } catch (error) {
      message.error("Erro ao cadastrar o funcionário");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [groupedPermissions, setGroupedPermissions] = useState<Map<string, PermissionModel[]>>(
    new Map(),
  );

  useEffect(() => {
    if (permissions) {
      const { allAvaliablePermission } = permissions;

      const grouped = new Map<string, PermissionModel[]>();
      allAvaliablePermission.forEach((ap) => {
        if (grouped.has(ap.module)) {
          const permissions = grouped.get(ap.module);
          permissions?.push(ap);
          grouped.set(ap.module, permissions!);
          return;
        }
        grouped.set(ap.module, [ap]);
      });
      setGroupedPermissions(grouped);
      if (!isEdit) {
        const defaultIds = permissions.employeeTypeDefaultPermissions.map((p) => p.id);
        form.setFieldsValue({ permissions: defaultIds });
      }
    }
  }, [form, isEdit, permissions]);

  const { data: employeeToEdit } = useGetOneWithParams<EmployeeModel>(employeeService, {
    id: uid as string,
    enabled: !!uid,
  });

  useEffect(() => {
    if (isEdit && uid && employeeToEdit) {
      form.setFieldsValue({
        name: employeeToEdit.name,
        isActive: employeeToEdit.isActive,
        type: employeeToEdit.type,
        permissions: employeeToEdit.user.permissions.map((p) => p.id),
      });
    }
  }, [employeeToEdit, form, isEdit, uid]);

  return {
    permissions,
    form,
    handleSubmit,
    groupedPermissions,
    navigate,
    isSubmitting,
    employeeToEdit,
  };
}
