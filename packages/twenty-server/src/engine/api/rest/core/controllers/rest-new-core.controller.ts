import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { SendEmailDto } from 'src/engine/api/rest/core/controllers/rest-api-core.controller';
import { SendEmailWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/send-email.workflow-action';
import { WorkflowSendEmailActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-input.type';

@Controller('rest/email')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
export class RestApiNewCoreController {
  constructor(
    private readonly sendEmailWorkflowAction: SendEmailWorkflowAction,
  ) {
    console.log('Email Controller is being instantiated');
  }

  @Get('/send')
  async handleApiGetEmail() {
    return { message: 'hello' };
  }

  @Post('/send')
  async handleApiSendEmail(
    @Req() request: Request & { workspace: { id: string } },
    @Body() emailDto: SendEmailDto,
    @Res() res: Response,
  ) {
    console.log('emailDto', emailDto);
    const workspace = request.workspaceId;

    console.log('workspace', workspace);
    if (!workspace) {
      throw new BadRequestException('Workspace not found');
    }

    // Prepare input for SendEmailWorkflowAction
    const sendEmailInput: WorkflowSendEmailActionInput = {
      email: emailDto.to,
      subject: emailDto.subject,
      body: emailDto.body,
      connectedAccountId: emailDto.connectedAccount,
      // Optional: handle attachments if needed in the future
    };

    console.log('sendEmailInput', sendEmailInput);

    // Use the existing SendEmailWorkflowAction to send the email
    const result = await this.sendEmailWorkflowAction.execute(sendEmailInput);

    console.log(result);

    res.status(200).send('hello');
    // return { message: 'hello' };
  }
}
