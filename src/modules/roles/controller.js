import { RoleService } from './service.js';
import { RoleDTO } from './dto.js';
import { createRoleSchema, updateRoleSchema } from './validator.js';
import { ApiResponse } from '#utils/apiResponse.js';
import { asyncHandler } from '#utils/asyncHandler.js';

export const createRole = asyncHandler(async (req, res) => {
  const validatedData = createRoleSchema.parse(req.body);
  const role = await RoleService.createRole(validatedData);
  res.status(201).json(new ApiResponse(201, RoleDTO.role(role), 'Role created successfully'));
});

export const getAllRoles = asyncHandler(async (req, res) => {
  const queryString = req.query;
  const { roles, total } = await RoleService.getAllRoles(queryString);

  const meta = {
    total,
    page: parseInt(queryString.page) || 1,
    limit: parseInt(queryString.limit) || 10
  };

  res.status(200).json({
    success: true,
    message: 'Roles fetched successfully',
    data: RoleDTO.rolesList(roles),
    meta
  });
});

export const getRoleById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await RoleService.getRoleById(id);
  res.status(200).json(new ApiResponse(200, RoleDTO.role(role), 'Role fetched successfully'));
});

export const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validatedData = updateRoleSchema.parse(req.body);

  const role = await RoleService.updateRole(id, validatedData);
  res.status(200).json(new ApiResponse(200, RoleDTO.role(role), 'Role updated successfully'));
});

export const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await RoleService.deleteRole(id);
  res.status(200).json(new ApiResponse(200, null, 'Role deleted successfully'));
});
