import User from "@/models/User"
import dbConnect from "@/utils/dbConnection"
import { NextResponse } from "next/server"

export const DELETE = async (req, { params }) => {
    try {
        await dbConnect();
        
        const { id } = await params;
        
        const deletedUser = await User.findByIdAndDelete(id);
        
        if (!deletedUser) {
            return NextResponse.json({ 
                message: 'User not found' 
            }, { status: 404 });
        }
        
        return NextResponse.json({ 
            message: 'User deleted successfully',
            userId: id
        }, { status: 200 });
    } catch (error) {
        console.error('deleteUser error:', error);
        return NextResponse.json({ 
            message: 'Error deleting user',
            error: error.message 
        }, { status: 500 });
    }
}

export const GET = async (req, { params }) => {
    try {
        await dbConnect();
        
        const { id } = await params;
        
        const user = await User.findById(id).select('-pass');
        
        if (!user) {
            return NextResponse.json({ 
                message: 'User not found' 
            }, { status: 404 });
        }
        
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error('getUser error:', error);
        return NextResponse.json({ 
            message: 'Error fetching user',
            error: error.message 
        }, { status: 500 });
    }
}

export const PUT = async (req, { params }) => {
    try {
        await dbConnect();
        
        const { id } = await params;
        const body = await req.json();
        
        // Remove password from update if it's empty
        if (body.pass === '' || body.pass === undefined) {
            delete body.pass
        } else {
            // Hash updated password
            const bcrypt = (await import('bcryptjs')).default
            body.pass = await bcrypt.hash(body.pass, 12)
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        ).select('-pass');
        
        if (!updatedUser) {
            return NextResponse.json({ 
                message: 'User not found' 
            }, { status: 404 });
        }
        
        return NextResponse.json({ 
            message: 'User updated successfully',
            user: updatedUser
        }, { status: 200 });
    } catch (error) {
        console.error('updateUser error:', error);
        return NextResponse.json({ 
            message: 'Error updating user',
            error: error.message 
        }, { status: 500 });
    }
}
