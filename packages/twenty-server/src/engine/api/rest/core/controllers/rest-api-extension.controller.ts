import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';
import { Request, Response } from 'express';

import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { SendEmailWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/send-email.workflow-action';
import { WorkflowSendEmailActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-input.type';

class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  text: string;

  @IsString()
  html: string;

  @IsString()
  connectedAccount: string;

  @IsArray()
  @IsOptional()
  attachments?: Array<{
    filename: string;
    content: string;
  }>;

  @IsString()
  @IsOptional()
  inReplyTo?: string;

  @IsArray()
  @IsOptional()
  references?: string[];

  @IsString()
  @IsOptional()
  externalThreadId?: string;
}

@Controller('rest/email')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
export class RestApiExtensionController {
  constructor(
    private readonly sendEmailWorkflowAction: SendEmailWorkflowAction,
  ) {}

  @Post('/send')
  async handleApiSendEmail(
    @Req() request: Request,
    @Body() emailDto: SendEmailDto,
    @Res() res: Response,
  ) {
    console.log('emailDto', emailDto);
    const workspaceId = request.workspaceId;

    console.log('workspace', workspaceId);
    if (!workspaceId) {
      throw new BadRequestException('Workspace not found');
    }

    // Prepare input for SendEmailWorkflowAction
    const sendEmailInput: WorkflowSendEmailActionInput = {
      email: emailDto.to,
      subject: emailDto.subject,
      text: emailDto.text,
      html: emailDto.html,
      connectedAccountId: emailDto.connectedAccount,
      workspaceId,
      isHtml: true,
      inReplyTo: emailDto.inReplyTo,
      references: emailDto.references,
      externalThreadId: emailDto.externalThreadId,
      // Optional: handle attachments if needed in the future
    };

    console.log('sendEmailInput', sendEmailInput);

    // Use the existing SendEmailWorkflowAction to send the email
    const result = await this.sendEmailWorkflowAction.execute(sendEmailInput);

    console.log(result);

    res.status(200).send('hello');
  }
}
