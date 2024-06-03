import { Database } from '@infrastructure/Database';
import {
    AccountController,
    AdminController,
    PostController,
} from '@module/Controller';
import { AccountRepository, PostRepository } from '@module/Domain/Repository';
import { AccountNotification } from '@module/Infrastructure';
import { Authentication, Authorization, Validation } from '@module/Middleware';
import { AccountService, AdminService, PostService } from '@module/Service';
import {
    LogInSchema,
    ResetPasswordSchema,
    SavePostSchema,
    SignUpSchema,
    UpdateInfoSchema,
    UpdatePassWordSchema,
    VerifyOtpSchema,
} from '@module/Validation';
import { Router } from 'express';

const router = Router();
const database = new Database();
const postrepo = new PostRepository(database);
const acctrepo = new AccountRepository(database);
const acctNotification = new AccountNotification();

const postctr = new PostController(
    new PostService(postrepo, acctrepo),
    acctrepo,
);
const acctctr = new AccountController(
    new AccountService(acctrepo, acctNotification),
);
const adminctr = new AdminController(new AdminService(postrepo, acctrepo));

// add validations with joi, authentications and or authorizations

router.post('/account/signup', Validation(SignUpSchema), acctctr.signUp);
router.post('/account/login', Validation(LogInSchema), acctctr.logIn);
router.post(
    '/account/update-info',
    Authentication(acctrepo),
    Validation(UpdateInfoSchema),
    acctctr.updateInfo,
);
router.post(
    '/account/update-password',
    Authentication(acctrepo),
    Validation(UpdatePassWordSchema),
    acctctr.updatePassword,
);

router.get('/account', Authentication(acctrepo), acctctr.getUser);
router.get('/account/:userId', Authentication(acctrepo), acctctr.getUserById);
router.delete('/account', Authentication(acctrepo), acctctr.deleteUser);

router.post('/account/forgot-password/:email', acctctr.forgotPassword);
router.post(
    '/account/verify-otp',
    Validation(VerifyOtpSchema),
    acctctr.verifyOTP,
);
router.post(
    '/account/reset-password',
    Validation(ResetPasswordSchema),
    acctctr.resetPassword,
);

router.delete(
    '/admin/account/delete/:userId',
    Authentication(acctrepo),
    Authorization,
    adminctr.deleteUser,
);
router.post(
    '/admin/account/ban/:userId',
    Authentication(acctrepo),
    Authorization,
    adminctr.banUser,
);
router.delete(
    '/admin/post/delete/:postId',
    Authentication(acctrepo),
    Authorization,
    adminctr.deletePost,
);

router.post('/post', Validation(SavePostSchema), postctr.savePost);
router.get('/post/:postId', postctr.getPost);
router.get('/post', postctr.getPosts);
router.delete('/post/:postId', Authentication(acctrepo), postctr.deletePost);

export { router };
