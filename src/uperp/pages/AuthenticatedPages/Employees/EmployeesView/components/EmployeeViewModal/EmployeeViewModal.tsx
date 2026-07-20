import { EmployeeModel } from "@/model/employee.model";
import { EmployeesPaths } from "@/routes/AuthenticatedRoutes/Employees/routes";
import { Avatar, Button, Descriptions, Empty, Modal, Space, Tag, Typography } from "antd";
import { Pencil, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

type EmployeeViewModalProps = {
  employee: EmployeeModel | undefined;
  onCancel: () => void;
};

export const EmployeeViewModal = ({ employee, onCancel }: EmployeeViewModalProps) => {
  const navigate = useNavigate();

  const onGoEdit = () => {
    if (employee) navigate(EmployeesPaths.EDIT.replace(":uid", employee?.uid));
  };

  return (
    <Modal
      open={employee !== null}
      title={
        employee ? (
          <Space>
            <Avatar style={{ background: "#F26B1F" }}>{employee.name.charAt(0)}</Avatar>
            {employee.name}
          </Space>
        ) : (
          ""
        )
      }
      onCancel={onCancel}
      footer={
        employee && (
          <Space>
            <Button onClick={onCancel}>Fechar</Button>
            <Button type="primary" onClick={onGoEdit} icon={<Pencil size={14} />}>
              Editar
            </Button>
          </Space>
        )
      }
      width={640}
      destroyOnHidden
    >
      {employee && (
        <>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Cargo">
              <Tag color="orange">{employee.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="E-mail">{employee.user.username || "—"}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={employee.isActive ? "green" : "default"}>
                {employee.isActive ? "Ativo" : "Inativo"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Title level={5} style={{ marginTop: 16 }}>
            <Space size={6}>
              <ShieldCheck size={16} color="#F26B1F" /> Permissões
            </Space>
          </Title>
          {employee.user.permissions?.length ? (
            <Space wrap size={[6, 6]}>
              {employee.user.permissions.map((k, index) => (
                <Tag key={index} color="blue">
                  {k.title}
                </Tag>
              ))}
            </Space>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhuma permissão atribuída" />
          )}
        </>
      )}
    </Modal>
  );
};
