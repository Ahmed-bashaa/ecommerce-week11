
import SubCategory from "../../../DB/Models/sub-category.model.js"
import Category from '../../../DB/Models/category.model.js'
import generateUniqueString from "../../utils/generate-Unique-String.js"
import cloudinaryConnection from "../../utils/cloudinary.js"
import slugify from "slugify"
import Brand from "../../../DB/Models/brand.model.js"

//============================== add SubCategory ==============================//
export const addSubCategory = async (req, res, next) => {
    // 1- destructuring the request body
    const { name } = req.body
    const { categoryId } = req.params
    const { _id } = req.authUser

    // 2- check if the subcategory name is already exist
    const isNameDuplicated = await SubCategory.findOne({ name })
    if (isNameDuplicated) {
        return next({ cause: 409, message: 'SubCategory name is already exist' })
        // return next( new Error('Category name is already exist' , {cause:409}) )
    }

    // 3- check if the category is exist by using categoryId
    const category = await Category.findById(categoryId)
    if (!category) return next({ cause: 404, message: 'Category not found' })

    // 4- generate the slug
    const slug = slugify(name, '-')

    // 5- upload image to cloudinary
    if (!req.file) return next({ cause: 400, message: 'Image is required' })

    const folderId = generateUniqueString(4)
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`
    })


    // 6- generate the subCategory object
    const subCategory = {
        name,
        slug,
        Image: { secure_url, public_id },
        folderId,
        addedBy: _id,
        categoryId
    }
    // 7- create the subCategory
    const subCategoryCreated = await SubCategory.create(subCategory)
    res.status(201).json({ success: true, message: 'subCategory created successfully', data: subCategoryCreated })
}
//*********************UpdateSubCategory******************** */

export const UpdateSubCategory = async (req, res, next) => {
        // 1- destructuring the request body
        const { name, oldPublicId } = req.body
        // 2- destructuring the request params 
        const { SubcategoryId } = req.query
        // 3- destructuring _id from the request authUser
        const { _id } = req.authUser
    
        // 4- check if the category is exist bu using categoryId
        const checkSubcategory = await SubCategory.findById(SubcategoryId)
        if (!checkSubcategory) return next({ cause: 404, message: 'SubCategory not found' })
    
        // 5- check if the use want to update the name field
        if (name) {
            // 5.1 check if the new category name different from the old name
            if (name == checkSubcategory.name) {
                return next({ cause: 400, message: 'Please enter different Subcategory name from the existing one.' })
            }
    
            // 5.2 check if the new Subcategory name is already exist
            const isNameDuplicated = await SubCategory.findOne({ name })
            if (isNameDuplicated) {
                return next({ cause: 409, message: 'Category name is already exist' })
            }
    
            // 5.3 update the category name and the category slug
            checkSubcategory.name = name
            checkSubcategory.slug = slugify(name, '-')
        }
    
        // 6- check if the user want to update the image
        if (oldPublicId) {
            if (!req.file) return next({ cause: 400, message: 'Image is required' })
    
            const NewPublicId = oldPublicId.split(`${checkSubcategory.folderId}/`)[1]
    
            const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
                folder: `${process.env.MAIN_FOLDER}/Categories/${checkSubcategory.categoryId.folderId}/subCategories/${checkSubcategory.folderId}`,
                public_id: NewPublicId
            })
    
            checkSubcategory.Image.secure_url = secure_url
        }
    
        // 7- set value for the updatedBy field
        checkSubcategory.updatedBy = _id
    
      const Update_SubCategory= await checkSubcategory.save()
        res.status(200).json({ success: true, message: 'Category updated successfully', data: Update_SubCategory })
}
//====================== delete Subcategory ======================//
export const deleteCategory = async (req, res, next) => {
    const { SubcategoryId } = req.query

    // 2-delete the related subcategories
    const subCategories = await SubCategory.findByIdAndDelete(SubcategoryId)
    if (!subCategories) return next({ status: 404, message: "SubCategory not found" });

    //3- delete the related brands
    const brands = await Brand.deleteMany({ SubcategoryId })
    if (brands.deletedCount <= 0) {
        console.log(brands.deletedCount);
        console.log('There is no related brands');
    }

//  delete image folder from cloudinar
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${subCategories.categoryId.folderId}/subCategories/${subCategories.folderId}`)
    
//  delete the SubCategory folder from cloudinary
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${subCategories.categoryId.folderId}/subCategories/${subCategories.folderId}`)

    res.status(200).json({ success: true, message: 'SubCategory deleted successfully' })
}

//**********************getAllSubCategories************************* */

export const getAllSubCategories = async (req, res, next) => {
    // nested populate
    const Subcategories = await SubCategory.find().populate(
        [
            {
                path: 'Brands',
            }
        ]
    )
    // console.log(categories);
    res.status(200).json({ success: true, message: 'Subcategories fetched successfully', data: Subcategories })
}
