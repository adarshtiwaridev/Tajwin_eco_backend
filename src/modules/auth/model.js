import mongoose from 'mongoose';

// ==========================================
// 1. Role Schema
// ==========================================
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// ==========================================
// 2. Permission Schema
// ==========================================
const permissionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// ==========================================
// 3. Role-Permission Schema
// ==========================================
const rolePermissionSchema = new mongoose.Schema(
  {
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    permissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission',
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index to guarantee uniqueness of a permission for a role
rolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

// ==========================================
// 4. User Schema
// ==========================================
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// ==========================================
// 5. Session Schema
// ==========================================
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    ip: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Export compiling check
export const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);
export const Permission = mongoose.models.Permission || mongoose.model('Permission', permissionSchema);
export const RolePermission = mongoose.models.RolePermission || mongoose.model('RolePermission', rolePermissionSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
