import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { Users } from './users.entity';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    @Get("/all")
    async getAllUsers() {
        const users = await this.usersService.findAll();
        return users;
    }
    @Patch("/updatepassword/:id")
    async updatePassword(@Param('id') id: string, @Body('newPassword') newPassword: string) {
        const result = await this.usersService.updatePassword(id, newPassword);
        return result;
    }
    @Patch("/disable/:id")
    async disableUser(@Param('id') id: string) {
        const result = await this.usersService.disableUser(id);
        return result;
    }
    @Delete("/delete/:id")
    async deleteUser(@Param('id') id: string) {
        const result = await this.usersService.deleteUser(id);
        return result;
    }
    @Patch("/enable/:id")
    async enableUser(@Param('id') id: string) {
        const result = await this.usersService.enableUser(id);
        return result;
    }
    @Patch("/update/:id")
    async updateProfile(@Param('id') id: string, @Body() profile: Partial<Users>) {
        const result = await this.usersService.updateProfile(id, profile);
        return result;
    }
}
