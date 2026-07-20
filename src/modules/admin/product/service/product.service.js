import ProductRepository from '../repository/product.repository.js';
import { ApiError } from '#common/ApiError.js';
import { APIFeatures } from '#utils/apiFeatures.js';
import { generateSKU, generateSlug } from '../utils/product.utils.js';
import { uploadToCloudinary } from '../utils/cloudinary.service.js';

class ProductService {
  /**
   * Process image and video uploads to Cloudinary
   */
  async processImages(files) {
    const mediaData = { featuredImage: null, images: [], video: null };

    if (files?.featuredImage?.[0]) {
      const file = files.featuredImage[0];
      mediaData.featuredImage = await uploadToCloudinary(file.buffer, 'products/images', 'image');
    }

    if (files?.images?.length > 0) {
      for (const file of files.images) {
        const mediaObj = await uploadToCloudinary(file.buffer, 'products/images', 'image');
        mediaData.images.push(mediaObj);
      }
    }

    if (files?.video?.[0]) {
      const file = files.video[0];
      mediaData.video = await uploadToCloudinary(file.buffer, 'products/videos', 'video');
    }

    return mediaData;
  }

  async createProduct(productData, files, adminId) {
    productData.createdBy = adminId;

    // Generate SKU and Slug if not provided
    if (!productData.sku) {
      productData.sku = generateSKU(productData.brand);
    }
    if (!productData.slug) {
      productData.slug = generateSlug(productData.name);
    }

    // Ensure SKU/Slug are unique
    const existing = await ProductRepository.findBySkuOrSlug(productData.sku);
    if (existing) {
      throw new ApiError('Product with this SKU or Slug already exists', 400);
    }

    // Handle media uploads
    if (files) {
      const uploadedMedia = await this.processImages(files);
      if (uploadedMedia.featuredImage) {
        productData.featuredImage = uploadedMedia.featuredImage;
      }
      if (uploadedMedia.images.length > 0) {
        productData.images = uploadedMedia.images;
      }
      if (uploadedMedia.video) {
        productData.video = uploadedMedia.video;
      }
    }

    if (!productData.featuredImage) {
      throw new ApiError('Featured image is required', 400);
    }

    return await ProductRepository.create(productData);
  }

  async getAllProducts(queryString) {
    const baseQuery = ProductRepository.getBaseQuery();
    
    // Setup API Features (Pagination, Filter, Sort, Search)
    const features = new APIFeatures(baseQuery, queryString)
      .filter()
      .search(['name', 'brand', 'model', 'category', 'sku'])
      .sort()
      .limitFields();

    const totalFeatures = new APIFeatures(ProductRepository.getBaseQuery(), queryString)
      .filter()
      .search(['name', 'brand', 'model', 'category', 'sku']);
    
    const totalCount = await totalFeatures.query.countDocuments();

    features.paginate();
    const products = await features.query;

    const page = parseInt(queryString.page, 10) || 1;
    const limit = parseInt(queryString.limit, 10) || 10;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      products,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages,
      }
    };
  }

  async getProductById(id) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      throw new ApiError('Product not found', 404);
    }
    return product;
  }

  async updateProduct(id, updateData, files, adminId) {
    updateData.updatedBy = adminId;

    if (updateData.slug || updateData.sku) {
       const existing = await ProductRepository.model.findOne({
          $or: [{ sku: updateData.sku }, { slug: updateData.slug }],
          _id: { $ne: id },
          deletedAt: null
       });
       if (existing) {
         throw new ApiError('Product with this SKU or Slug already exists', 400);
       }
    }

    if (files && (files.featuredImage || files.images || files.video)) {
      const uploadedMedia = await this.processImages(files);
      if (uploadedMedia.featuredImage) {
        updateData.featuredImage = uploadedMedia.featuredImage;
      }
      if (uploadedMedia.images.length > 0) {
        updateData.images = updateData.images 
          ? [...updateData.images, ...uploadedMedia.images] 
          : uploadedMedia.images;
      }
      if (uploadedMedia.video) {
        updateData.video = uploadedMedia.video;
      }
    }

    return await ProductRepository.updateById(id, updateData);
  }

  async deleteProduct(id) {
    // Soft delete
    return await ProductRepository.deleteById(id, false);
  }

  async restoreProduct(id) {
    const product = await ProductRepository.model.findOneAndUpdate(
      { _id: id, deletedAt: { $ne: null } },
      { deletedAt: null, status: 'Draft' },
      { new: true }
    );
    if (!product) {
      throw new ApiError('Product not found or not deleted', 404);
    }
    return product;
  }

  async changeStatus(id, status, adminId) {
    return await ProductRepository.updateById(id, { status, updatedBy: adminId });
  }

  async featureImage(id, imageUrl, adminId) {
    const product = await this.getProductById(id);
    
    // Ensure image exists in images array
    if (!product.images.includes(imageUrl) && product.featuredImage !== imageUrl) {
      throw new ApiError('Image must be in the product images gallery first', 400);
    }

    return await ProductRepository.updateById(id, { featuredImage: imageUrl, updatedBy: adminId });
  }

  async deleteImage(id, imageUrl, adminId) {
    const product = await this.getProductById(id);
    
    if (product.featuredImage === imageUrl) {
      throw new ApiError('Cannot delete the featured image. Change it first.', 400);
    }

    const updatedImages = product.images.filter(img => img !== imageUrl);
    
    return await ProductRepository.updateById(id, { images: updatedImages, updatedBy: adminId });
  }

  async uploadImages(id, files, adminId) {
    const product = await this.getProductById(id);
    if (!files || (!files.images && !files.featuredImage && !files.video)) {
       throw new ApiError('No media provided for upload', 400);
    }

    const uploadedMedia = await this.processImages(files);
    const updateData = { updatedBy: adminId };

    if (uploadedMedia.featuredImage) {
      updateData.featuredImage = uploadedMedia.featuredImage;
    }
    if (uploadedMedia.images.length > 0) {
      updateData.images = [...product.images, ...uploadedMedia.images];
    }
    if (uploadedMedia.video) {
      updateData.video = uploadedMedia.video;
    }

    return await ProductRepository.updateById(id, updateData);
  }

  async bulkDelete(ids) {
    return await ProductRepository.bulkDelete(ids);
  }

  async bulkUpdateStatus(ids, status) {
    return await ProductRepository.bulkUpdateStatus(ids, status);
  }

  async getDashboardStats() {
    return await ProductRepository.getDashboardStats();
  }
}

export default new ProductService();
